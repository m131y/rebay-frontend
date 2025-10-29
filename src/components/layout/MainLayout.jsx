const MainLayout = ({ children, className = "" }) => {
  return (
    <div>
      <div className={`${className}`}>{children}</div>
    </div>
  );
};

export default MainLayout;
