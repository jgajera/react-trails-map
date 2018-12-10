import React, { Component } from 'react';
import DebounceInput from 'react-debounce-input';

class SearchBar extends Component {
    state = {
        query: '',
        parksFound: []
    }

    updateQuery = (query) => {
        this.setState({ query: query })
    }

    render() {
        return (
            <DebounceInput
              type="text"
              placeholder="Search by title or author"
              value = { this.state.query }
              debounceTimeout={1000}
              onChange = {this.props.searchFunc}
             />
        );
    }
}

export default SearchBar