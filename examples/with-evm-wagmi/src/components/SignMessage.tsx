import { useSignMessage } from 'wagmi'

export function SignMessage() {
  const {
    data: signature,
    error,
    isLoading,
    signMessage,
  } = useSignMessage()

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const element = event.target as HTMLFormElement
          const formData = new FormData(element)
          const message = formData.get('message') as string
          signMessage({ message })
        }}
      >
        <input name="message" type="text" required />
        <button disabled={isLoading} type="submit">
          {isLoading ? 'Check Wallet' : 'Sign Message'}
        </button>
      </form>

      {signature && (
        <div>Signature: {signature}</div>
      )}
      {error && <div>Error: {error?.message}</div>}
    </>
  )
}
