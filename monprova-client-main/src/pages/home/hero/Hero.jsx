import heroImg from '../../../assets/heroBanner.jpg';
import Button from '../../../components/Button';
import { Link } from 'react-router-dom';

import HomeNavbar from '../../../components/NavBar/HomeNavBar';

const Hero = () => {
  return (
    <div
      className="relative min-h-screen text-left flex items-center"
      style={{
        backgroundImage: `url(${heroImg})`,
        backgroundSize: 'cover',
      }}
    >
      {/* Logo top-left */}
     <HomeNavbar></HomeNavbar>

      {/* Hero content */}
      <div className="max-w-lg ml-24">
        <h1 className="mb-5 text-5xl font-bold primary-color leading-normal">
          আপনার মানসিক <span className="tertiary-color">স্বাস্থ্যের বিশ্বস্ত সঙ্গী</span>
        </h1>

        <p className="mb-5 secondary-color">
          ডিপ্রেশন, উদ্বেগ বা চাপ মোকাবিলায় এখনই খুঁজুন সঠিক সহায়তা।
          সহজে ডাক্তার বুক করুন, নিজের অগ্রগতি ট্র্যাক করুন, এবং মানসিক
          সুস্থতার পথে এগিয়ে যান।
        </p>

        <section className="flex gap-4">
          <Link to="/login">
            <Button btnName="লগইন করুন" bgColor="bg-secondary-color" />
          </Link>
          <Link to="/signup">
            <Button btnName="সাইন আপ করুন" bgColor="bg-primary-color" />
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Hero;
