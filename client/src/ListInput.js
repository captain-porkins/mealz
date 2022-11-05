import React, { Component } from "react"
import CreatableSelect from "react-select/creatable"

export class ListInput extends Component {
  constructor(props) {
    console.log("instantiating")
    super(props)
    this.state = {
      currentTag: "",
    }
    this.onChange = (allTags) => {
      if (props.onChange) {
        props.onChange(allTags)
      }
    }
  }

  handleKeyDown(event) {
    if (!this.state.currentTag) {
      return
    }
    switch (event.key) {
      case "Enter":
      case "Tab":
        this.setState((currentState) => {
          const allTags = [...(this.props.value ?? []), currentState.currentTag]
          this.onChange(allTags)
          return {
            ...currentState,
            currentTag: "",
          }
        })

        event.preventDefault()
        break
      default:
    }
  }

  render() {
    return (
      <CreatableSelect
        components={{
          DropdownIndicator: null,
        }}
        inputValue={this.state.currentTag}
        isClearable
        isMulti
        menuIsOpen={false}
        onChange={(input) => {
          const allTags = input.map((t) => t.value)
          this.onChange(allTags)
        }}
        onInputChange={(input) =>
          this.setState((values) => ({
            ...values,
            currentTag: input,
          }))
        }
        onKeyDown={this.handleKeyDown.bind(this)}
        placeholder="Type something and press enter..."
        value={this.props.value?.map((v) => ({ label: v, value: v }))}
      />
    )
  }
}
