import {
  Box,
  CircularProgress,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  styled
} from "@mui/material";
import {
  Block,
  Close,
  FlashOn,
  FormatListBulleted,
  MenuBook,
  Person,
  MenuOpen,
} from "@mui/icons-material";
import {
  useAssociatedPlayerValue,
  usePlayerDetailsValue,
} from "../../state/playerDetails.state";
import { useTranslate } from "react-polyglot";
import { DialogBaseView } from "./Tabs/DialogBaseView";
import { PlayerModalErrorBoundary } from "./ErrorHandling/PlayerModalErrorBoundary";
import { usePermissionsValue } from "../../state/permissions.state";
import { userHasPerm } from "../../utils/miscUtils";
import { fetchNui } from "../../utils/fetchNui";
import React, { useState, useEffect } from "react";
import {
  PlayerModalTabs,
  usePlayerModalTabValue,
  useSetPlayerModalResource,
  usePlayerModalResourceValue,
  useSetPlayerModalTab,
  useSetPlayerModalVisibility,
} from "@nui/src/state/playerModal.state";

const classes = {
  listItem: `PlayerModal-listItem`,
  listItemBan: `PlayerModal-listItemBan`,
};

const StyledList = styled(List)(({ theme }) => ({
  [`& .${classes.listItem}`]: {
    borderRadius: 8,
    "&.Mui-selected:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
  },

  [`& .${classes.listItemBan}`]: {
    borderRadius: 8,
    "&:hover, &.Mui-selected": {
      background: theme.palette.error.main,
    },
    "&.Mui-selected:hover": {
      backgroundColor: "rgba(194,13,37, 0.8)",
    },
  },
}));

const LoadingModal: React.FC = () => (
  <Box
    display="flex"
    flexGrow={1}
    width="100%"
    justifyContent="center"
    alignItems="center"
  >
    <CircularProgress />
  </Box>
);

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(2),
}));

const PlayerModal: React.FC = () => {
  const setModalOpen = useSetPlayerModalVisibility();
  const playerDetails = usePlayerDetailsValue();
  const assocPlayer = useAssociatedPlayerValue();

  const handleClose = () => {
    setModalOpen(false);
  };

  if (!assocPlayer) return null;

  const error = (playerDetails as any).error;

  return (
    <>
      <DialogTitle style={{ borderBottom: "1px solid rgba(221,221,221,0.54)" }}>
        [{assocPlayer.id}]{" "}
        {playerDetails?.player?.displayName ?? assocPlayer.name}
        <StyledCloseButton onClick={handleClose} size="large">
          <Close />
        </StyledCloseButton>
      </DialogTitle>
      <Box display="flex" px={2} pt={2} flexShrink={1} overflow="hidden">
        <PlayerModalErrorBoundary>
          {error ? (
            <>
              <h2
                style={{
                  marginLeft: "auto",
                  marginRight: "auto",
                  textAlign: "center",
                  fontWeight: "500",
                  maxWidth: "70%",
                  paddingTop: "2em",
                }}
              >
                {error}
              </h2>
            </>
          ) : (
            <>
              <Box
                minWidth={200}
                pr={2}
                borderRight="1px solid rgba(221,221,221,0.54)"
              >
                <DialogList />
              </Box>
              <React.Suspense fallback={<LoadingModal />}>
                <DialogBaseView />
              </React.Suspense>
            </>
          )}
        </PlayerModalErrorBoundary>
      </Box>
    </>
  );
};

interface DialogTabProps {
  title: string;
  tab: PlayerModalTabs;
  curTab: PlayerModalTabs;
  icon: JSX.Element;
  isDisabled?: boolean;
  resource: any;
}

const DialogTab: React.FC<DialogTabProps> = ({
  isDisabled,
  curTab,
  tab,
  icon,
  title,
  resource
}) => {
  const setTab = useSetPlayerModalTab();
  const setResource = useSetPlayerModalResource();
  const currentResource = usePlayerModalResourceValue();
  const stylingClass =
    tab === PlayerModalTabs.BAN ? classes.listItemBan : classes.listItem;

  const isSelected = resource ? currentResource == resource : curTab === tab;

  return (
    <ListItemButton
      className={stylingClass}
      selected={isSelected}
      onClick={() => {
        if (resource) {
          setTab(PlayerModalTabs.ACTIONS);
        }
        setTab(tab);
        setResource(resource ? resource : "")
      }}
      disabled={isDisabled}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={title} />
    </ListItemButton>
  );
};

interface Tab {
  resource: string;
  title: string;
}
interface CustomTabsProps {
  tabs: Tab;
}

const CustomTabs: React.FC<CustomTabsProps> = ({tabs}) => {
  const curTab = usePlayerModalTabValue();
  const playerPerms = usePermissionsValue();
  const len = Object.entries(tabs).length;
  if (len > 0) {
    return (
      <span>
        <Divider sx={{mt: 2, mb: 2}}>User Created</Divider>
        {
          Object.entries(tabs).map(([_,value]) =>
            <DialogTab
              title={value.title}
              tab={PlayerModalTabs.CARD}
              curTab={curTab}
              resource={value.resource}
              icon={<MenuOpen />}
              isDisabled={!userHasPerm("players.ban", playerPerms)}
            />)
        }
      </span>
    )
  } else {
    return <div style={{height: 0, width: 0}}></div>
  }
}

const DialogList: React.FC = () => {
  const curTab = usePlayerModalTabValue();
  const t = useTranslate();
  const playerPerms = usePermissionsValue();
  const [tabs, setTabs] = useState<Tab>();

  const fetchCard = async () => {
    const response = await fetchNui("fetchCustomTabs");
    const data = response.e

    setTabs(data); // Update the state with the card data
  };

  useEffect(() => {
    fetchCard(); // Call the async function
  }, []);

  // Handle the case when the tab data is not available yet
  if (!tabs) {
    return (
      <LoadingModal />
    )
  }
  return (
    <StyledList>
      <DialogTab
        title={t("nui_menu.player_modal.tabs.actions")}
        tab={PlayerModalTabs.ACTIONS}
        curTab={curTab}
        resource={null}
        icon={<FlashOn />}
      />
      <DialogTab
        title={t("nui_menu.player_modal.tabs.info")}
        tab={PlayerModalTabs.INFO}
        curTab={curTab}
        resource={null}
        icon={<Person />}
      />
      <DialogTab
        title={t("nui_menu.player_modal.tabs.ids")}
        tab={PlayerModalTabs.IDENTIFIERS}
        curTab={curTab}
        resource={null}
        icon={<FormatListBulleted />}
      />
      <DialogTab
        title={t("nui_menu.player_modal.tabs.history")}
        tab={PlayerModalTabs.HISTORY}
        curTab={curTab}
        resource={null}
        icon={<MenuBook />}
      />
      <DialogTab
        title={t("nui_menu.player_modal.tabs.ban")}
        tab={PlayerModalTabs.BAN}
        curTab={curTab}
        resource={null}
        icon={<Block />}
        isDisabled={!userHasPerm("players.ban", playerPerms)}
      />
      <CustomTabs
        tabs={tabs}
      />
    </StyledList>
  );
};

export default PlayerModal;
