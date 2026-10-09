export const createRemoveMethod = ({ context, run }) => {
  const removeFunction = run || async function ({ _id }) {
    return context.collection().removeAsync({ _id })
  }

  return {
    name: `${context.name}.methods.remove`,
    backend: true,
    schema: {
      _id: String
    },
    run: removeFunction
  }
}
