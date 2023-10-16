import { useEffect, useRef, useState } from "react";
import githubLogo from "./assets/github.png";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { NotificationsPanel } from "./components/NotificationsPanel.tsx";
import { SearchPanel } from "./components/SearchPanel.tsx";
import { invoke } from "@tauri-apps/api/tauri";

function SplashScreen(props: { setWelcomed: (w: boolean) => void }) {
  const welcomeSectionRef = useRef<HTMLDivElement>(null);
  function onWelcome() {
    setTimeout(() => props.setWelcomed(true), 500);
    welcomeSectionRef.current?.classList.add("fade-out");
  }

  useEffect(() => {
    const t = setTimeout(onWelcome, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="container">
      <div ref={welcomeSectionRef}>
        <h1>HubHelper v0.1</h1>
        <br />
        <a href="#">
          <img src={githubLogo} className="logo" alt="GitHub logo" />
        </a>
        <p>Manage notifications, search PRs and more.</p>
      </div>
    </div>
  );
}

function App() {
  const [welcomed, setWelcomed] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  useEffect(() => {
    invoke("has_token").then((data) => {
      alert(data);
      setHasToken(data as boolean);
    });
  }, []);

  return (
    <>
      {!welcomed && <SplashScreen setWelcomed={setWelcomed} />}
      {welcomed && (
        <>
          <div className="row-center gap-1">
            <img src={githubLogo} alt="github logo" className="logo sm" />
            <h3 className="title no-select">HubHelper</h3>
          </div>
          <Tabs forceRenderTabPanel={true}>
            <TabList className="tab-list">
              <Tab className="tab no-select" selectedClassName="tab-selected">
                Notifications
              </Tab>
              <Tab className="tab no-select" selectedClassName="tab-selected">
                Search
              </Tab>
            </TabList>
            <TabPanel>
              <NotificationsPanel
                hasToken={hasToken}
                setHasToken={setHasToken}
              />
            </TabPanel>
            <TabPanel>
              <SearchPanel />
            </TabPanel>
          </Tabs>
        </>
      )}
    </>
  );
}

export default App;
