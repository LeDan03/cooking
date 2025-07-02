import PropTypes from 'prop-types';

const CustomButton = ({classname, content, onClick})=>{
    return <div className={`rounded-xl hover:bg-red-600 flex flex-col justify-center items-center ${classname} text-center`} onClick={onClick}>
        {content}
    </div>
}

CustomButton.propTypes = {
    classname: PropTypes.string,
    content: PropTypes.element.isRequired,
    onClick: PropTypes.func,
};

export default CustomButton;