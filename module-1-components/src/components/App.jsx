import React from 'react';
import Header from './Header/Header';
import Filter from './Filter/Filter';
import ProductsList from './ProductsList/ProductsList';


function App() {
  return (
    <div>
		  <Header />
		  <Filter />
		  <ProductsList />
    </div>
  );
}

export default App;
