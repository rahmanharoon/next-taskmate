import Head from "next/head";
import Custom404 from "./404";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import { GetServerSideProps } from "next";
import TaskList from "../components/TaskList";
import { initializeApollo } from "../lib/client";
import TaskFilter from "../components/TaskFilter";
import CreateTaskForm from "../components/CreateTaskForm";
import {
  TasksDocument,
  TasksQueryVariables,
  TaskStatus,
  useTasksQuery,
} from "../generated/graphql-frontend";

interface TasksQuery {
  tasks: {
    id: number;
    title: string;
    status: string;
  }[];
}

const isTaskStatus = (value: string): value is TaskStatus =>
  Object.values(TaskStatus).includes(value as TaskStatus);

export default function Home() {
  const router = useRouter();
  const status =
    typeof Array.isArray(router.query.status) && router.query.status?.length
      ? router.query.status[0]
      : undefined;
  if (status !== undefined && !isTaskStatus(status)) {
    return <Custom404 />;
  }
  const prevStatus = useRef(status);
  useEffect(() => {
    prevStatus.current = status;
  }, [status]);
  const result = useTasksQuery({
    variables: { status },
    fetchPolicy:
      prevStatus.current === status ? "cache-first" : "cache-and-network",
  });
  const tasks = result?.data?.tasks;
  return (
    <div>
      <Head>
        <title>Task Mate</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CreateTaskForm onSuccess={result.refetch} />
      {result.loading && !tasks ? (
        <p>Loading..</p>
      ) : result.error ? (
        <p>Error Please try again</p>
      ) : tasks && tasks.length > 0 ? (
        <TaskList tasks={tasks} />
      ) : (
        <p className="no-task-message">No Tasks Listed</p>
      )}
      <TaskFilter status={status} />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const status =
    typeof context.params?.status === "string"
      ? context.params.status
      : undefined;

  if (status === undefined || isTaskStatus(status)) {
    const apolloClient = initializeApollo();

    await apolloClient.query<TasksQuery, TasksQueryVariables>({
      query: TasksDocument,
      variables: {
        status,
      },
    });
    return {
      props: {
        initialApolloState: apolloClient.cache.extract(),
      },
    };
  }
  return { props: {} };
};
