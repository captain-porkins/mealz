import _ from "lodash"
import React from "react"
import { ListInput } from "./ListInput"
import { stringifyIngredient, splitIngredient } from "./ingredientUtils"
export function RecipeForm() {
  const [inputs, setInputs] = React.useState({ meal: "lunch" })

  const handleChange = async (event) => {
    const name = event.target.name
    const value = event.target.value
    const type = event.target.type
    let recipe = {}
    if (name === "recipe_name" && value !== inputs.recipe_name) {
      // recipe name has changed
      try {
        recipe = await (await fetch(`/recipe/${value}`)).json()
        recipe.ingredients = recipe.ingredients.map(stringifyIngredient)
      } catch {
        recipe = {}
      }
    }
    console.log(name, value)
    setInputs((values) => ({
      ...recipe,
      ...values,
      [name]: type === "number" ? parseInt(value, 10) : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const body = {
      ..._.pick(inputs, "servings", "tags", "method"),
      ingredients: inputs.ingredients.map((i) => splitIngredient(i)),
    }

    await fetch(`/recipe/${inputs.recipe_name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    setInputs({})
    alert("Recipe stored succesfully!")
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
      <form
        onSubmit={handleSubmit}
        className="form-style-5 recipeForm"
        key="form"
      >
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
        <label>
          Ingredients:
          <ListInput
            onChange={(ingredients) => {
              setInputs((oldState) => ({ ...oldState, ingredients }))
            }}
            value={inputs.ingredients}
          />
        </label>
        <label>
          Tags:
          <ListInput
            onChange={(tags) =>
              setInputs((oldState) => ({ ...oldState, tags }))
            }
            value={inputs.tags}
          />
        </label>
        <label className="recipeMethod">
          Method
          <textarea
            type="text"
            name="method"
            value={inputs.method || ""}
            onChange={handleChange}
            style={{ width: "100%", height: "95%" }}
          />
        </label>
        <input type="submit" style={{ gridArea: "c" }} />
      </form>
    </div>
  )
}
