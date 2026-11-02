type PlaceholderProps = {
  title: string
}

function Placeholder({ title }: PlaceholderProps) {
  return (
    <main className="placeholder-screen">
      <h1 className="placeholder-title">{title}</h1>
    </main>
  )
}

export default Placeholder
