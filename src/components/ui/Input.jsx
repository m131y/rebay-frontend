const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  minlength,
  required = false,
  className,
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      minlength={minlength}
      onChange={onChange}
      required={required}
      className={`w-full px-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 transition-all ${className}`}
    />
  );
};

export default Input;
