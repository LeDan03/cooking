import PropTypes from 'prop-types';

const CustomButton = ({ classname, content, onClick }) => {
    return <button className={`rounded-xl flex flex-col justify-center items-center ${classname} text-center`} onClick={onClick}>
        {content}
    </button>
}

CustomButton.propTypes = {
    classname: PropTypes.string,
    content: PropTypes.element.isRequired,
    onClick: PropTypes.func,
};

export default CustomButton;