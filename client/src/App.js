import "./App.css"
import { RecipeForm } from "./RecipeForm"
import { MealPlan } from "./MealPlan"
import { Component } from "react"
import { Tabs, TabList, Tab, TabPanel } from "react-tabs"
import "react-tabs/style/react-tabs.css"

class App extends Component {
  render() {
    return (
      <div>
        <Tabs forceRenderTabPanel={true}>
          <TabList>
            <Tab>Add Meal</Tab>
            <Tab>Generate Mealz</Tab>
          </TabList>

          <TabPanel>
            <RecipeForm />
          </TabPanel>
          <TabPanel>
            <MealPlan />
          </TabPanel>
        </Tabs>
      </div>
    )
  }
}

export default App
