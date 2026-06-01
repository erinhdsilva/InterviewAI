import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { PublicLayout }     from '@/layout/public_layout';
import AuthenticationLayout from '@/layout/auth_layout';
import ProtectRoutes        from '@/layout/protected-routes';
import { MainLayout }       from '@/layout/main_layout';

import HomePage             from '@/routes/home';
import AboutUsPage          from '@/routes/AboutUsPage';
import { SignInPage }       from '@/routes/sing-in';
import { SignUpPage }       from '@/routes/sign-up';
import { Dashboard }        from '@/routes/dashboard';
import { CreateEditPage }   from '@/routes/create-edit-page';
import { MockLoadPage }     from '@/routes/mock-load-page';
import { MockInterviewPage } from '@/routes/mock-interview-page';
import { Feedback }         from '@/routes/feedback';
import { Generate }         from '@/components/generate';
import ContactUsPage from './routes/Contactus';
import ServicesPage from './routes/ServicesPage';

const App = () => {
  return (
    <Router>
      <Routes>

        {/** Public routes wrap */}
        <Route element={<PublicLayout />}>
          {/** Home at “/” */}
          <Route index element={<HomePage />} />

          {/** About at “/about” */}
          <Route path="about" element={<AboutUsPage />} />
          <Route path="contact" element={<ContactUsPage />} />
          <Route path="services" element={<ServicesPage />} />
        </Route>

        {/** Authentication-only routes */}
        <Route element={<AuthenticationLayout />}>
          <Route path="signin/*" element={<SignInPage />} />
          <Route path="signup/*" element={<SignUpPage />} />
        </Route>

        {/** Protected, logged-in-only routes */}
        <Route element={<ProtectRoutes><MainLayout /></ProtectRoutes>}>
          <Route path="generate" element={<Generate />}>
            <Route index element={<Dashboard />} />
            <Route path=":interviewId" element={<CreateEditPage />} />
            <Route path="interview/:interviewId" element={<MockLoadPage />} />
            <Route
              path="interview/:interviewId/start"
              element={<MockInterviewPage />}
            />
            <Route path="feedback/:interviewId" element={<Feedback />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
};

export default App;
