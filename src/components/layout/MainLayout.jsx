const MainLayout = ({ children, className = "" }) => {
  return (
    <div
      className={`
        w-full 
        max-w-full
        mx-auto 
        min-h-screen 
        bg-white 
        flex flex-col
        ${className} 
      `}
    >
      {children}
    </div>
  );
};

export default MainLayout;
