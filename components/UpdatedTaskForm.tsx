import React, { useState } from "react";
import { useRouter } from "next/router";
import { useUpdateTaskMutation } from "../generated/graphql-frontend";

interface Values {
  title: string;
}

interface Props {
  id: number;
  initialValues: Values;
}

const UpdatedTaskForm: React.FC<Props> = ({ initialValues, id }) => {
  const [values, setValues] = useState<Values>(initialValues);
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const [updateTask, { loading, error }] = useUpdateTaskMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await updateTask({
        variables: {
          input: {
            id,
            title: values.title,
          },
        },
      });
      if (res.data?.updateTask) {
        router.push("/");
      }
    } catch (e) {}
  };

  let errorMessage = "";

  if (error) {
    if (error?.networkError) {
      errorMessage = "Network Error";
    } else {
      errorMessage = " An error occurred";
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="alert error">{error.message}</p>}
      <p>
        <label htmlFor="" className="feild-label">
          Title
        </label>
        <input
          type="text"
          className="text-input"
          value={values.title}
          name="title"
          onChange={handleChange}
        />
      </p>
      <p>
        <button type="submit" className="button" disabled={loading}>
          {loading ? "Loading" : "Save"}
        </button>
      </p>
    </form>
  );
};

export default UpdatedTaskForm;
