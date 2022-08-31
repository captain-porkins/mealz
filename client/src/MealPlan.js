import { Component, Fragment } from "react"
import Collapsible from "react-collapsible"

export class MealPlan extends Component {
  constructor(props) {
    super(props)
    this.state = {
      displayMealPlan: false,
      mealPlan: null,
    }
  }
  async handleClick() {
    const mealPlan = await (
      await fetch(
        `zach/mealplan?${new URLSearchParams({
          mouths: 2,
          days: 7,
        })}`
      )
    ).json()
    this.setState({
      displayMealPlan: true,
      mealPlan,
    })
  }
  render() {
    let mealPlan = null

    if (this.state.displayMealPlan) {
      const formattedMealz = this.state.mealPlan.mealz.map((meal) => {
        console.log(meal)
        return (
          <Collapsible trigger={meal.recipe._id}>
            <p>Days: {meal.days}</p>
          </Collapsible>
        )
      })
      console.log(formattedMealz)
      mealPlan = (
        <div>
          <Fragment>{formattedMealz}</Fragment>
        </div>
      )
      console.log(mealPlan)
    }
    return (
      <div>
        <button
          onClick={this.handleClick.bind(this)}
          className="mealzButton"
          key="button"
        >
          Generate Mealz
        </button>
        {mealPlan}
      </div>
    )
  }
}
