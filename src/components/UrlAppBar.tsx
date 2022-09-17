import { useTheme } from "@mui/material"
import React from "react"

const UrlAppBar: React.FC<{ url: string }> = ({ url }) => {
  const theme = useTheme()
  const currentMode = theme.palette.mode

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 10px",
        backgroundColor: currentMode === "dark" ? "#424242" : "#f5f5f5",
        height: 32,
        borderBottom: `1px solid ${
          currentMode === "dark" ? "#333" : "rgba(0, 0, 0, 0.12)"
        }`,
      }}
    >
      <div
        style={{
          borderRadius: "30px",
          backgroundColor: currentMode === "dark" ? "#292929" : "#e1e1e1",
          padding: "5px 15px",
          marginTop: "5px",
          width: "100%",
          marginBottom: "5px",
        }}
      >
        <span
          style={{
            fontSize: "1rem",
            color: currentMode === "dark" ? "#ffffff" : "#333",
            userSelect: "none",
          }}
        >
          {url}
        </span>
      </div>
    </div>
  )
}

export default UrlAppBar
