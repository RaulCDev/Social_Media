const Icons = () => {
    return (
      <div className="relative">
        <div className="absolute top-0 right-0 mr-10 mt-0">
          <div className="icons flex gap-20">
            <a href="https://www.linkedin.com/in/ra%C3%BAl-conde-rodr%C3%ADguez/" target="_blank" rel="noopener noreferrer">
              <img src="/linkedin.svg" alt="logo_linkedin" />
            </a>
            <a href="https://github.com/RaulCDev" target="_blank" rel="noopener noreferrer">
              <img src="/github.svg" alt="logo_github" />
            </a>
            <img src="/user.svg" alt="user_icon" className="icons" />
          </div>
        </div>
      </div>
    );
  };
  
  export default Icons;