import { Select, SimpleGrid, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { setupAPIMetrics } from "../../services/api";
import { tokenService } from "../../services/auth/tokenService";
import NewTasks from "../../model/tasks";
import { useToast } from '@chakra-ui/react'

export interface WorkRelations {
  rel: string;
  source: string;
  target: {
    id: number;
    url: string;
  };
}
interface Task {
  ID: string;
  Title: string;
  "Work Item Type": string;
  State: string;
  "State Change Date": string;
  Area: string;
  "Iteration Path": string;
  "Activated By": string;
  "Activated Date": string;
  "Assigned To": string | undefined;
  "Changed By": string;
  "Changed Date": string;
  "Completed Work": string | undefined;
  "Created By": string;
  "Created Date": string;
  Description: string | undefined;
  Reason: string;
  "Story Points": number | undefined | string;
  "Cycle Time": number | undefined;
  "Sprint Start Date": string;
  Tags: string;
  Activity: string;
}

interface Team {
  id: string;
}

interface SelectSprintProps {
  teamId: Team;
  sprint: Iterations[];
  setworkItemRelations?: (itemRelations: WorkRelations[]) => void;
  setTasks?: (task: Task[]) => void;
}

export interface Iterations {
  id: string;
  name: string;
  path: string;
  attributes: {
    startDate: string;
    finishDate: string;
    timeFrame: string;
  };
  url: string;
}

const token = tokenService.getToken()
const project_id = tokenService.getProjectId()
const organization = tokenService.getOrganization()

const axiosInstance = setupAPIMetrics({ organization, project_id, token });

export default function SprintSelect({
  teamId,
  sprint,
  setTasks,
}: SelectSprintProps) {
  const [selectedSprint, setSeletedSprint] = useState("");
  const toast = useToast()

  const handleChange = async (event: any) => {
    setSeletedSprint(event.target.value);

    if (event.target.value) {
      let workitens: number[] = await axiosInstance
        .get(
          `https://dev.azure.com/${organization}/${project_id}/${teamId}/_apis/work/teamsettings/iterations/${event.target.value}/workitems?api-version=6.0-preview.1`
        )
        .then(async (response) => {
          let itens: any;
          if (response.status === 200) {
            itens = response.data.workItemRelations.map((item: any) => {
              return item.target.id;
            });
          }
          return itens;
        })

      if (workitens === undefined) {
        setTasks([]);
      } else if (workitens.length !== 0) {
        await axiosInstance
          .get(`wit/workitems?ids=${workitens}&expand=all&api-version=6.0`)
          .then((response) => {
            if (response.status === 200) {
              const newTasks = new NewTasks();
              let formatedTasks: Task[] = newTasks.formatJson(
                response.data.value
              );
              setTasks(formatedTasks);
            }
          });
      } else {
        setTasks([]);
        toast({
          title: `Nenhuma sprint foi selecionada ou esta sprint não tem dados para serem exibidos!!!`,
          status: 'warning',
          position: 'top-right',
          isClosable: true,
        })
      }

    } else {
      setTasks([]);
    }
  };

  return (
    <>
      <VStack spacing="8">
        <SimpleGrid
          minChildWidth="240px"
          spacing={["6", "8"]}
          alignSelf="flex-start"
        >
          <VStack spacing={3}>
            <Select
              placeholder="Sprints"
              size="lg"
              onChange={(ev) => handleChange(ev)}
              value={selectedSprint}
            >
              {sprint.map((item: Iterations) => {
                return (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                );
              })}
            </Select>
          </VStack>
        </SimpleGrid>
      </VStack>
    </>
  );
}
