import React, { useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import styled from "@mui/material/styles/styled";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import Home from "@mui/icons-material/Home";
import PowerSettingsNew from "@mui/icons-material/PowerSettingsNew";

import useAuth from "app/hooks/useAuth";
import useSettings from "app/hooks/useSettings";
import { NotificationProvider } from "app/contexts/NotificationContext";

import { Span } from "app/components/Typography";
import ShoppingCart from "app/components/ShoppingCart";
import { MatxMenu, MatxSearchBox } from "app/components";
import { NotificationBar } from "app/components/NotificationBar";
import { themeShadows } from "app/components/MatxTheme/themeColors";
import { topBarHeight } from "app/utils/constant";

// Styled Components
const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

const TopbarRoot = styled("div")({
  top: 0,
  zIndex: 96,
  height: topBarHeight,
  boxShadow: themeShadows[8],
  transition: "all 0.3s ease",
});

const TopbarContainer = styled("div")(({ theme }) => ({
  padding: "8px",
  paddingLeft: 18,
  paddingRight: 20,
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: theme.palette.primary.main,
  [theme.breakpoints.down("sm")]: { paddingLeft: 16, paddingRight: 16 },
  [theme.breakpoints.down("xs")]: { paddingLeft: 14, paddingRight: 16 },
}));

const UserMenu = styled("div")({
  padding: 4,
  display: "flex",
  borderRadius: 24,
  cursor: "pointer",
  alignItems: "center",
  "& span": { margin: "0 8px" },
});

const StyledItem = styled(MenuItem)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  minWidth: 185,
  "& a": {
    width: "100%",
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
  },
  "& span": { marginRight: "10px", color: theme.palette.text.primary },
}));

const IconBox = styled("div")(({ theme }) => ({
  display: "inherit",
  [theme.breakpoints.down("md")]: { display: "none !important" },
}));

const Layout1Topbar = () => {
  const theme = useTheme();
  const { settings, updateSettings } = useSettings();
  const { logout, user } = useAuth();
  const isMdScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [userName, setUserName] = useState(user?.name || "Usuário Adm");

  useEffect(() => {
    const storedUserData = localStorage.getItem("user_data");

    if (storedUserData) {
      try {
        // Parseando a string JSON para objeto
        const userData = JSON.parse(storedUserData);

        // Acessando o nome do usuário e definindo no estado
        const name = userData?.attributes?.name;
        if (name) {
          setUserName(name); // Atualiza o nome do usuário
        }
      } catch (error) {
        console.error("Erro ao parsear user_data", error);
      }
    }
  }, []);

  const updateSidebarMode = (sidebarSettings) => {
    updateSettings({ layout1Settings: { leftSidebar: { ...sidebarSettings } } });
  };

  const handleSidebarToggle = () => {
    const { layout1Settings } = settings;
    const mode =
      isMdScreen && layout1Settings.leftSidebar.mode === "close"
        ? "mobile"
        : layout1Settings.leftSidebar.mode === "full"
          ? "close"
          : "full";
    updateSidebarMode({ mode });
  };

  // Função para remover cookies
  const clearCookies = () => {
    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const cookieName = cookie.split("=")[0].trim();
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    console.log("Cookies removidos.");
  };

  const handleLogout = async () => {
    try {
      await logout();
      clearCookies();
      localStorage.removeItem("user_data");
      console.log("Logout bem-sucedido.");

      window.location.reload();
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  return (
    <TopbarRoot>
      <TopbarContainer>
        <Box display="flex"></Box>
        <Box display="flex" alignItems="center">
          <MatxSearchBox />

          <NotificationProvider>
            <NotificationBar />
          </NotificationProvider>

          <ShoppingCart />

          <MatxMenu
            menuButton={
              <UserMenu>
                <Span>
                  Olá <strong>{userName}</strong> {/* Exibe o nome do usuário */}
                </Span>
                <Avatar src={user?.avatar} sx={{ cursor: "pointer" }} />
              </UserMenu>
            }
          >
            <StyledItem>
              <Link to="/">
                <Home />
                <Span sx={{ marginInlineStart: 1 }}>Home</Span>
              </Link>
            </StyledItem>

            <StyledItem onClick={handleLogout}>
              <PowerSettingsNew />
              <Span sx={{ marginInlineStart: 1 }}>Logout</Span>
            </StyledItem>
          </MatxMenu>
        </Box>
      </TopbarContainer>
    </TopbarRoot>
  );
};

export default memo(Layout1Topbar);
