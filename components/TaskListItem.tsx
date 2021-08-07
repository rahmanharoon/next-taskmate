import Link from "next/link";
import React, { useEffect } from "react";
import { Reference } from "@apollo/client";
import { TaskStatus } from "../generated/graphql-backend";
import {
  Task,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from "../generated/graphql-frontend";

interface Props {
  task: Task;
}

const TaskListItem: React.FC<Props> = ({ task }) => {
  const { id, status, title } = task;

  const [deleteTask, { loading, error }] = useDeleteTaskMutation({
    variables: { id: task.id },
    errorPolicy: "all",
    update: (cache, result) => {
      const deletedTask = result.data?.deleteTask;
      if (deletedTask) {
        cache.modify({
          fields: {
            tasks(taskRefs: Reference[], { readField }) {
              return taskRefs.filter((taskRef) => {
                return readField("id", taskRef) !== deletedTask.id;
              });
            },
          },
        });
      }
    },
  });

  const onHandleDelete = async () => {
    try {
      await deleteTask();
    } catch (error) {
      //   alert("An error occured");
    }
  };

  useEffect(() => {
    if (error) {
      alert("An error occured");
    }
  }, [error]);

  const [updateTask, { loading: updateTaskLoading, error: updateTaskError }] =
    useUpdateTaskMutation({ errorPolicy: "all" });

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.checked
      ? TaskStatus.Completed
      : TaskStatus.Active;
    updateTask({
      variables: {
        input: {
          id: task.id,
          status: newStatus,
        },
      },
    });
  };

  useEffect(() => {
    if (updateTaskError) {
      alert("Something went wrong");
    }
  }, [updateTaskError]);

  return (
    <li className="task-list-item">
      <label htmlFor="" className="checkbox">
        <input
          type="checkbox"
          onChange={handleStatusChange}
          checked={task.status === TaskStatus.Completed}
          disabled={updateTaskLoading}
        />
        <span className="checkbox-mark">&#10003;</span>
      </label>
      <Link href="/update/[id]" as={`/update/${id}`}>
        <a className="task-list-item-title">{title}</a>
      </Link>
      {title} ({status})
      <button
        disabled={loading}
        onClick={onHandleDelete}
        className="task-list-item-delete"
      >
        &times;
      </button>
    </li>
  );
};

export default TaskListItem;
