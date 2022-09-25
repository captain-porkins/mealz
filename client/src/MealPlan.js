import React, { Component } from "react"
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
    }
  }
  async handleClick() {
    const mealPlan = await (
      await fetch(
        `zach/mealplan?${new URLSearchParams({
          mouths: this.state.plan.mouths,
          days: this.state.plan.days,
        })}`
      )
    ).json()
    this.setState({
      displayMealPlan: true,
      mealPlan,
    })
  }
  render() {
    let mealz = null

    if (this.state.mealPlan) {
      mealz = this.formatMealz(mealz)
    }
    return (
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
            Meal
            <select
              name="meal"
              value={this.state.plan.meal}
              onChange={(event) => {
                this.setState({
                  ...this.meal,
                  plan: { ...this.state.plan, meal: event.target.value },
                })
              }}
            >
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
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
    )
  }

  formatMealz() {
    const formattedMealz = this.state.mealPlan.mealz.map((meal) => {
      console.log(meal)
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
