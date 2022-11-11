import * as _ from "lodash"
import React, { Component } from "react"
import { stringifyIngredient } from "./ingredientUtils"
import { ListInput } from "./ListInput"
import Collapsible from "react-collapsible"
export class MealPlan extends Component {
  constructor(props) {
    super(props)
    this.state = {
      plan: {
        days: 7,
        mouths: 2,
        meal: "lunch",
      },
      mealPlan: null,
      tags: [],
    }
  }

  render() {
    let mealz = null
    let ingredients = null

    if (this.state.mealPlan) {
      mealz = this.formatMealz()
      ingredients = this.formatIngredients()
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
        <div className="mealPlan">
          <h1 style={{ gridArea: "plh", justifySelf: "center" }}>Plan</h1>
          <form className="form-style-5 mealPlanForm">
            <label>
              Days
              <input
                type="number"
                name="days"
                value={this.state.plan.days}
                onChange={(event) => {
                  this.setState({
                    ...this.state,
                    plan: { ...this.state.plan, days: event.target.value },
                  })
                }}
              />
            </label>
            <label>
              Mouths
              <input
                type="number"
                name="mouths"
                value={this.state.plan.mouths}
                onChange={(event) => {
                  this.setState({
                    ...this.state,
                    plan: { ...this.state.plan, mouths: event.target.value },
                  })
                }}
              />
            </label>
            <label>
              Tags:
              <ListInput
                onChange={(tags) =>
                  this.setState((oldState) => ({ ...oldState, tags }))
                }
                value={this.state.tags}
              />
            </label>
          </form>
          <h1 style={{ gridArea: "mlh", justifySelf: "center" }}>Mealz</h1>
          <button
            onClick={this.handleClick.bind(this)}
            className="mealzButton"
            key="button"
          >
            Generate Mealz
          </button>
          {mealz}
          {ingredients}
        </div>
      </div>
    )
  }

  async handleClick() {
    const mealPlan = await (
      await fetch(
        `/mealplan?${new URLSearchParams({
          mouths: this.state.plan.mouths,
          days: this.state.plan.days,
          meal: this.state.plan.meal,
          ...(this.state.tags.length ? { tags: this.state.tags } : {}),
        })}`
      )
    ).json()
    this.setState({
      displayMealPlan: true,
      mealPlan,
    })
  }

  formatMealz() {
    const formattedMealz = this.state.mealPlan.mealz.map((meal) => {
      return (
        <p key={meal.recipe._id}>
          {meal.recipe._id} for {meal.days} days
        </p>
      )
    })
    return (
      <div key="mealz" className="mealz">
        {formattedMealz}
      </div>
    )
  }

  formatIngredients() {
    const allIngredients = this.state.mealPlan.mealz.flatMap((m) => {
      return m.recipe.ingredients ?? []
    })
    const grouped = _.groupBy(
      allIngredients,
      (i) => `${i.name}-${i.quantity?.unit ?? "none"}`
    )
    const ingredientStrings = Object.entries(grouped).flatMap(
      ([groupId, ingredients]) => {
        if (groupId.endsWith("none")) {
          return ingredients.map(stringifyIngredient)
        }
        return stringifyIngredient({
          name: ingredients[0].name,
          quantity: {
            unit: ingredients[0].quantity.unit,
            value: _.sumBy(ingredients, (i) => i.quantity.value),
          },
        })
      }
    )
    console.log(ingredientStrings)
    return (
      <div
        style={{
          gridArea: "igs",
        }}
      >
        <Collapsible trigger={"Shopping List"}>
          {ingredientStrings.map((ingredient) => {
            return (
              <p
                key={ingredient}
                style={{ justifyContent: "left", textAlign: "left" }}
              >
                {ingredient}
              </p>
            )
          })}
        </Collapsible>
      </div>
    )
  }
}
