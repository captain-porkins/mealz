import _ from "lodash"
import React from "react"
import CreatableSelect from "react-select/creatable"

function splitIngredient({ value }) {
  const unitsFormat = /(?<name>.*) (?<quantity>[0-9]+)(?<unit>\w*)?/i
  const match = value.match(unitsFormat)
  let ret
  if (match) {
    ret = {
      name: match.groups.name.toLowerCase(),
      quantity: {
        value: parseInt(match.groups.quantity.toLowerCase(), 10),
        ...(match.groups.unit ? { unit: match.groups.unit.toLowerCase() } : {}),
      },
    }
  } else {
    ret = {
      name: value,
    }
  }
  return ret
}

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
        recipe = await (await fetch(`zach/recipe/${value}`)).json()
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
    console.log(inputs.meal)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    console.log(inputs.tags)
    const body = {
      ..._.pick(inputs, "servings", "ingredients", "method"),
      ingredients: inputs.ingredients.map((i) => splitIngredient(i)),
      tags: inputs.tags.map((t) => t.value),
    }

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

  const handleIngredientsChange = async (inputValue) => {
    setInputs((values) => ({
      ...values,
      ingredients: inputValue,
    }))
  }

  const handleCurrentIngredientChange = (inputValue) => {
    setInputs((values) => ({
      ...values,
      currentIngredient: inputValue,
    }))
  }

  const handleKeyDownIngredient = (event) => {
    if (!inputs.currentIngredient) {
      return
    }
    switch (event.key) {
      case "Enter":
      case "Tab":
        setInputs((values) => ({
          ...values,
          currentIngredient: "",
          ingredients: [
            ...(values.ingredients ?? []),
            {
              label: values.currentIngredient,
              value: values.currentIngredient,
            },
          ],
        }))
        event.preventDefault()
        break
      default:
    }
  }

  const handleKeyDownTags = (event) => {
    if (!inputs.currentTag) {
      return
    }
    switch (event.key) {
      case "Enter":
      case "Tab":
        setInputs((values) => ({
          ...values,
          currentTag: "",
          tags: [
            ...(values.tags ?? []),
            {
              label: values.currentTag,
              value: values.currentTag,
            },
          ],
        }))
        event.preventDefault()
        break
      default:
    }
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
          <CreatableSelect
            components={{
              DropdownIndicator: null,
            }}
            inputValue={inputs.currentIngredient}
            isClearable
            isMulti
            menuIsOpen={false}
            onChange={handleIngredientsChange}
            onInputChange={handleCurrentIngredientChange}
            onKeyDown={handleKeyDownIngredient}
            placeholder="Type something and press enter..."
            value={inputs.ingredients}
          />
        </label>
        <label>
          Tags:
          <CreatableSelect
            components={{
              DropdownIndicator: null,
            }}
            inputValue={inputs.currentTag}
            isClearable
            isMulti
            menuIsOpen={false}
            onChange={(input) =>
              setInputs((values) => ({
                ...values,
                tags: input,
              }))
            }
            onInputChange={(input) =>
              setInputs((values) => ({
                ...values,
                currentTag: input,
              }))
            }
            onKeyDown={handleKeyDownTags}
            placeholder="Type something and press enter..."
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
