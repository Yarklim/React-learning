import './ProductsList.css';
import products from '../../data/products.json';
import ProductListItem from './ProductListItem';

const ProductsList = () => {
  return (
    <ul className="products">
      {products.map(({ id, ...rest }) => (
        <ProductListItem key={id} {...rest} />
      ))}
    </ul>
  );
};

export default ProductsList;
