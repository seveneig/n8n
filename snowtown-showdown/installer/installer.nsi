; ---------------------------------------------------------------
; Snowtown Showdown - Windows-Installer (NSIS)
; Bauen mit:  makensis installer.nsi
; Ergebnis:   ../dist/Snowtown-Showdown-Setup.exe
; ---------------------------------------------------------------

Unicode true
!include "MUI2.nsh"

!define APPNAME "Snowtown Showdown"
!define APPVERSION "1.0.0"
!define UNINSTKEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\SnowtownShowdown"

Name "${APPNAME}"
OutFile "..\dist\Snowtown-Showdown-Setup.exe"
BrandingText "${APPNAME} ${APPVERSION}"

; Installation pro Benutzer - kein Admin noetig
RequestExecutionLevel user
InstallDir "$LOCALAPPDATA\${APPNAME}"
InstallDirRegKey HKCU "${UNINSTKEY}" "InstallLocation"

!define MUI_ABORTWARNING
!define MUI_WELCOMEPAGE_TITLE "Willkommen bei ${APPNAME}!"
!define MUI_WELCOMEPAGE_TEXT "Dieser Assistent installiert ${APPNAME} ${APPVERSION} auf deinem Computer.$\r$\n$\r$\nHilf Bruno Bommel, die verhexten Frostgrummel aufzutauen und Snowtown vor Eis-Yeti Knut zu retten!$\r$\n$\r$\nKlicke auf 'Weiter', um fortzufahren."
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "${APPNAME} jetzt spielen"
!define MUI_FINISHPAGE_RUN_FUNCTION LaunchGame

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "German"

Function LaunchGame
  ExecShell "open" "$INSTDIR\index.html"
FunctionEnd

Section "Spiel" SecGame
  SectionIn RO
  SetOutPath "$INSTDIR"
  File /r "..\game\*.*"

  WriteUninstaller "$INSTDIR\Uninstall.exe"

  ; Verknuepfungen (oeffnen das Spiel im Standardbrowser)
  CreateDirectory "$SMPROGRAMS\${APPNAME}"
  CreateShortCut "$SMPROGRAMS\${APPNAME}\${APPNAME}.lnk" "$INSTDIR\index.html"
  CreateShortCut "$SMPROGRAMS\${APPNAME}\${APPNAME} deinstallieren.lnk" "$INSTDIR\Uninstall.exe"
  CreateShortCut "$DESKTOP\${APPNAME}.lnk" "$INSTDIR\index.html"

  ; Eintrag unter "Apps & Features"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayName" "${APPNAME}"
  WriteRegStr HKCU "${UNINSTKEY}" "DisplayVersion" "${APPVERSION}"
  WriteRegStr HKCU "${UNINSTKEY}" "Publisher" "Snowtown Games"
  WriteRegStr HKCU "${UNINSTKEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNINSTKEY}" "UninstallString" "$\"$INSTDIR\Uninstall.exe$\""
  WriteRegDWORD HKCU "${UNINSTKEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNINSTKEY}" "NoRepair" 1
SectionEnd

Section "Uninstall"
  Delete "$INSTDIR\index.html"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"

  Delete "$SMPROGRAMS\${APPNAME}\${APPNAME}.lnk"
  Delete "$SMPROGRAMS\${APPNAME}\${APPNAME} deinstallieren.lnk"
  RMDir "$SMPROGRAMS\${APPNAME}"
  Delete "$DESKTOP\${APPNAME}.lnk"

  DeleteRegKey HKCU "${UNINSTKEY}"
SectionEnd
