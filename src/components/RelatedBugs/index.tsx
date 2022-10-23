import { useEffect, useState } from "react";
import NewTasks from "../../model/tasks";
import {
  setupAPIMetrics,
} from "../../services/api";
import { RelatedItem } from "../../hooks/RelatedItem";
import { Box, Divider, Heading, Link, Text } from "@chakra-ui/react";
import { tokenService } from "../../services/auth/tokenService";

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

interface RelatedBugsProps {
  task: Task;
}

const token = tokenService.getToken()
const project_id = tokenService.getProjectId()
const organization = tokenService.getOrganization()

const axiosInstance = setupAPIMetrics({organization, project_id ,token} );

export function RelatedBugs({ task }: RelatedBugsProps) {
  const workRelated = RelatedItem(task);
  const [relatedItem, setRelateItem] = useState<Task[]>();

  useEffect(() => {
    if (workRelated.length !== 0) {
      axiosInstance
        .get(
          `wit/workitems?ids=${workRelated.toString()}&expand=all&api-version=6.0`
        )
        .then((response) => {
          if (response.status === 200) {
            const newTasks = new NewTasks();
            let formatedTasks: Task[] = newTasks.formatJson(
              response.data.value
            );
            setRelateItem(formatedTasks);
          }
        }).catch(error => {
          console.warn("Related item error: " + error.response.data.message)
      });
    }
    
  }, [workRelated]);

  function returnBugs() {
    const bugs = relatedItem?.filter(
      (item) => item["Work Item Type"] === "Bug"
    );

    return typeof bugs?.length !== "undefined" ? (
      bugs?.map((item: Task, key: any) => {
        return (
          <Text key={key} fontSize="12">
            {item.ID} - {item.Title}
          </Text>
        );
      })
    ) : (
      <Text fontSize="12">There are no related bugs</Text>
    );
  }

  return (
    <Box mb="8">
      <Heading as="h3" size="sm">
        {task.ID} - {task.Title}
      </Heading>
      
      {returnBugs()}
      <Divider />
    </Box>
  );
}
