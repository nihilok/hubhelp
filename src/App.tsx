import { useEffect, useRef, useState } from "react";
import githubLogo from "./assets/github.png";
import { invoke } from "@tauri-apps/api/tauri";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { NotificationsPanel } from "./components/NotificationsPanel.tsx";

function App() {
  const [hasToken, setHasToken] = useState(false);
  const [token, setToken] = useState("");

  async function updateToken() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setHasToken(await invoke("set_token", { token }));
  }
  const [welcomed, setWelcomed] = useState(false);

  useEffect(() => {
    invoke("has_token").then((data) => {
      alert(data);
      setHasToken(data as boolean);
    });
  }, []);

  const welcomeSectionRef = useRef<HTMLDivElement>(null);
  function onWelcome() {
    setTimeout(() => setWelcomed(true), 1000);
    welcomeSectionRef.current?.classList.add("fade-out");
  }

  return (
    <>
      {(!welcomed || !hasToken) && (
        <div className="container">
          {!welcomed ? (
            <div onClick={onWelcome} ref={welcomeSectionRef}>
              <h1>HubHelp v0.1</h1>
              <div className="row">
                <a href="#">
                  <img src={githubLogo} className="logo" alt="GitHub logo" />
                </a>
              </div>
              <p>Manage notifications, search PRs and more.</p>
            </div>
          ) : (
            !hasToken && (
              <>
                <form
                  className="row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateToken();
                  }}
                >
                  <input
                    id="token-input"
                    onChange={(e) => setToken(e.currentTarget.value)}
                    placeholder="Personal Access Token..."
                  />
                  <button type="submit">UPDATE</button>
                </form>
              </>
            )
          )}
        </div>
      )}

      {welcomed && hasToken && (
        <>
          <div className="row-center gap-1">
            <img src={githubLogo} alt="github logo" className="logo sm" />
            <h3 className="title no-select">HubHelp</h3>
          </div>
          <Tabs forceRenderTabPanel={true}>
            <TabList className="tab-list">
              <Tab className="tab no-select" selectedClassName="tab-selected">
                Notifications
              </Tab>
              <Tab className="tab no-select" selectedClassName="tab-selected">
                Search Tool
              </Tab>
            </TabList>
            <TabPanel>
              <NotificationsPanel />
            </TabPanel>
            <TabPanel>
              <p>Coming soon...</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Enim
                excepturi, expedita modi molestias ullam unde? Aliquam,
                assumenda consequatur error, est incidunt, laborum magni
                mollitia nobis omnis rem repellat tempora vel voluptate? A alias
                atque consectetur dolor dolore, excepturi exercitationem
                expedita explicabo facilis fuga itaque libero maiores maxime
                obcaecati odio odit porro praesentium quibusdam sint soluta
                tempora, tempore ut voluptas voluptatibus.
              </p>
            </TabPanel>
          </Tabs>
        </>
      )}
    </>
  );
}

export default App;
