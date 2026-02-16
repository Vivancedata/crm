"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TaskTable } from "@/components/tasks/task-table";
import type { Task } from "@prisma/client";

type TaskWithRelations = Task & {
  contact: { firstName: string; lastName: string } | null;
  deal: { title: string } | null;
};

interface TaskListTabsProps {
  tasks: TaskWithRelations[];
  contacts: { id: string; name: string }[];
  deals: { id: string; title: string }[];
}

export function TaskListTabs({ tasks, contacts, deals }: TaskListTabsProps) {
  const [tab, setTab] = useState("all");

  const filteredTasks =
    tab === "all"
      ? tasks
      : tasks.filter((t) => t.status === tab);

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
        <TabsTrigger value="PENDING">
          Pending ({tasks.filter((t) => t.status === "PENDING").length})
        </TabsTrigger>
        <TabsTrigger value="IN_PROGRESS">
          In Progress ({tasks.filter((t) => t.status === "IN_PROGRESS").length})
        </TabsTrigger>
        <TabsTrigger value="COMPLETED">
          Completed ({tasks.filter((t) => t.status === "COMPLETED").length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value={tab}>
        <TaskTable tasks={filteredTasks} contacts={contacts} deals={deals} />
      </TabsContent>
    </Tabs>
  );
}
