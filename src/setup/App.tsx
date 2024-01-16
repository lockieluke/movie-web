import {
  ReactElement,
  Suspense,
  lazy,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { If, Then } from "react-if";
import { lazyWithPreload } from "react-lazy-with-preload";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { convertLegacyUrl, isLegacyUrl } from "@/backend/metadata/getmeta";
import { generateQuickSearchMediaUrl } from "@/backend/metadata/tmdb";
import { useOnlineListener } from "@/hooks/usePing";
import { AboutPage } from "@/pages/About";
import { AdminPage } from "@/pages/admin/AdminPage";
import VideoTesterView from "@/pages/developer/VideoTesterView";
import { DmcaPage, shouldHaveDmcaPage } from "@/pages/Dmca";
import { NotFoundPage } from "@/pages/errors/NotFoundPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/Login";
import { RegisterPage } from "@/pages/Register";
import { Layout } from "@/setup/Layout";
import { useHistoryListener } from "@/stores/history";
import { LanguageProvider } from "@/stores/language";

const DeveloperPage = lazy(() => import("@/pages/DeveloperPage"));
const TestView = lazy(() => import("@/pages/developer/TestView"));
const PlayerView = lazyWithPreload(() => import("@/pages/PlayerView"));
const SettingsPage = lazyWithPreload(() => import("@/pages/Settings"));

PlayerView.preload();
SettingsPage.preload();

function LegacyUrlView({ children }: { children: ReactElement }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const url = location.pathname;
    if (!isLegacyUrl(url)) return;
    convertLegacyUrl(location.pathname).then((convertedUrl) => {
      navigate(convertedUrl ?? "/", { replace: true });
    });
  }, [location.pathname, navigate]);

  if (isLegacyUrl(location.pathname)) return null;
  return children;
}

function QuickSearch() {
  const { query } = useParams<{ query: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (query) {
      generateQuickSearchMediaUrl(query).then((url) => {
        navigate(url ?? "/", { replace: true });
      });
    } else {
      navigate("/", { replace: true });
    }
  }, [query, navigate]);

  return null;
}

function QueryView() {
  const { query } = useParams<{ query: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (query) {
      navigate(`/browse/${query}`, { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [query, navigate]);

  return null;
}

function App() {
  useHistoryListener();
  useOnlineListener();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>();

  useLayoutEffect(() => {
    // eslint-disable-next-line no-alert
    if (window.localStorage.getItem("isLoggedIn") === "true") {
      setIsLoggedIn(true);
      return;
    }

    const password = prompt("Password");
    if (password === import.meta.env.VITE_PASSWORD) {
      setIsLoggedIn(true);
      window.localStorage.setItem("isLoggedIn", "true");
    } else {
      window.close();
    }
  }, []);

  return (
    <If condition={isLoggedIn === true}>
      <Then>
        <Layout>
          <LanguageProvider />
          <Routes>
            {/* functional routes */}
            <Route path="/s/:query" element={<QuickSearch />} />
            <Route path="/search/:type" element={<Navigate to="/browse" />} />
            <Route path="/search/:type/:query?" element={<QueryView />} />

            {/* pages */}
            <Route
              path="/media/:media"
              element={
                <LegacyUrlView>
                  <Suspense fallback={null}>
                    <PlayerView />
                  </Suspense>
                </LegacyUrlView>
              }
            />
            <Route
              path="/media/:media/:season/:episode"
              element={
                <LegacyUrlView>
                  <Suspense fallback={null}>
                    <PlayerView />
                  </Suspense>
                </LegacyUrlView>
              }
            />
            <Route path="/browse/:query?" element={<HomePage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/about" element={<AboutPage />} />

            {shouldHaveDmcaPage() ? (
              <Route path="/dmca" element={<DmcaPage />} />
            ) : null}

            {/* Settings page */}
            <Route
              path="/settings"
              element={
                <Suspense fallback={null}>
                  <SettingsPage />
                </Suspense>
              }
            />

            {/* admin routes */}
            <Route path="/admin" element={<AdminPage />} />

            {/* other */}
            <Route path="/dev" element={<DeveloperPage />} />
            <Route path="/dev/video" element={<VideoTesterView />} />
            {/* developer routes that can abuse workers are disabled in production */}
            {process.env.NODE_ENV === "development" ? (
              <Route path="/dev/test" element={<TestView />} />
            ) : null}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Then>
    </If>
  );
}

export default App;
