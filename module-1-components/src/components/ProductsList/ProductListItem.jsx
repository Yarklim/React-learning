import PropTypes from 'prop-types';
import './ProductListItem.css';

const ProductListItem = (props) => {
	const {url, price, currency, model} = props;

	return ( <li className="products__item">
					<div className="products__image-wrapper">
						<p className="products__sale">Акція</p>
						<img className="products__image" src={url} alt={model} />
					</div>
					<div className="products__descr">
						<h3 className="products__model">{model}</h3>
						<span className="products__price">{price ? price : 'Товар відсутній'}</span>
						{price && <span className="products__currency">{currency}</span>}
					</div>
					<button className="products__btn-buy" type="button">Купити</button>
				</li> );
}

ProductListItem.propTypes = {
	url: PropTypes.string.isRequired,
	price: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
	currency: PropTypes.string.isRequired,
	model: PropTypes.string.isRequired,
}
 
export default ProductListItem;