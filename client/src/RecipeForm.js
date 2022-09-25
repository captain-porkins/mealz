import React from "react"

export function RecipeForm() {
  const [inputs, setInputs] = React.useState({})

  const handleChange = async (event) => {
    const name = event.target.name
    const value = event.target.value
    const type = event.target.type
    console.log(inputs.meal)
    let recipe = {}
    if (name === "recipe_name" && value !== inputs.recipe_name) {
      // recipe name has changed
      try {
        recipe = await (
          await fetch(`http://localhost:80/zach/recipe/${value}`)
        ).json()
      } catch {
        recipe = {}
      }
    }
    setInputs((values) => ({
      ...recipe,
      ...values,
      [name]: type === "number" ? parseInt(value, 10) : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const body = { ...inputs }
    delete body.username
    delete body.recipe_name
    await fetch(`zach/recipe/${inputs.recipe_name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    setInputs({})
    alert("recipe sent!")
  }

  return (
    <form onSubmit={handleSubmit} className="form-style-5" key="form">
      <label>
        Meal
        <select name="meal" value={inputs.meal || ""} onChange={handleChange}>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>
      </label>
      <label>
        Enter your recipe name:
        <input
          type="text"
          name="recipe_name"
          value={inputs.recipe_name || ""}
          onChange={handleChange}
        />
      </label>
      <label>
        Enter number of servings:
        <input
          type="number"
          name="servings"
          value={inputs.servings || ""}
          onChange={handleChange}
        />
      </label>
      <input type="submit" />
    </form>
  )
}
