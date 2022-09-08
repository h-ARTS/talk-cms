export const useInputChange = (fn: (updatedContent: any) => void) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    fn(event)
  }

  return handleInputChange
}
