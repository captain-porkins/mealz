import React, { Component } from "react"
import Collapsible from "react-collapsible"
import { ListInput } from "./ListInput"
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

    if (this.state.mealPlan) {
      mealz = this.formatMealz(mealz)
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
        </div>
      </div>
    )
  }

  async handleClick() {
    const mealPlan = await (
      await fetch(
        `zach/mealplan?${new URLSearchParams({
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
        <Collapsible trigger={meal.recipe._id} key={meal.recipe._id}>
          <p>Days: {meal.days}</p>
        </Collapsible>
      )
    })
    return (
      <div key="mealz" className="mealz">
        {formattedMealz}
      </div>
    )
  }
}
