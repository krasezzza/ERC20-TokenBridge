import { NavLink } from 'react-router-dom';

export default function Footer() {
  return (
    <div className="footer">
      <p className="text-center">
        <NavLink to="/styleguide">
          <img
            src="https://limeacademy.tech/wp-content/uploads/2021/08/limeacademy_logo.svg"
            alt="lime-academy-logo-footer"
          />
        </NavLink>
      </p>
    </div>
  );
};
