import React from 'react';

const Sidebar = (props) => {
    return (
        <div>
	        <ul>
				{props.startMarkers
                    .map(book => (
                      <li key={book.id}>
                      {book.name}
                      </li>
                    ))}
	        </ul>
    </div>
    )
}

export default Sidebar