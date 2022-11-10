import React from "react"

export function LoginForm() {
  const [inputs, setInputs] = React.useState({ meal: "lunch" })

  const handleChange = async (event) => {
    const name = event.target.name
    const value = event.target.value
    const type = event.target.type
    setInputs((values) => ({
      ...values,
      [name]: type === "number" ? parseInt(value, 10) : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const body = inputs

    await fetch(`/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    setInputs({})
    window.location.href = "/"
  }

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        justifyItems: "center",
        margin: 0,
      }}
    >
      <form onSubmit={handleSubmit} className="form-style-5" key="form">
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={inputs.username || ""}
            onChange={handleChange}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={inputs.password || ""}
            onChange={handleChange}
          />
        </label>
        <input type="submit" />
      </form>
    </div>
  )
}
