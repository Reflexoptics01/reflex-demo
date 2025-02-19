  import { NextPage } from 'next';

  const FormPage: NextPage = () => {
      return (
          <div className="container mx-auto flex flex-col items-center justify-center h-screen w-screen">
              <div className="flex-1 w-full flex justify-center items-center">
              <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSd9Hm9nAt8apnC-c_1PiMDbl4uEBescwLAn5cg_-YmD6DyEMw/viewform?embedded=true" width="640" height="800" frameBorder="0" marginHeight={0} marginWidth={0}>Loading…</iframe>              </div>
          </div>      );
  };

  export default FormPage;