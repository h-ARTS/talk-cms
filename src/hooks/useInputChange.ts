export const useInputChange = (
  onInputChange: (updatedContent: any) => void
) => {
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement> & {
      target: { checked?: boolean }
    }
  ) => {
    onInputChange(event)
  }

  return handleInputChange
}
