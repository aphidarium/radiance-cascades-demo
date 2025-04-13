#include "demo.h"

int main() {
  if (!DirectoryExists("res")) {
    printf("Please run this file from the project root directory.\n");
    return 0;
  }

  std::string title = "Radiance Cascades ";
  title += VERSION_STAGE;
  title += VERSION;

  // SetConfigFlags(FLAG_WINDOW_RESIZABLE);
  InitWindow(SCREEN_WIDTH, SCREEN_HEIGHT, title.c_str());
  SetTargetFPS(GetMonitorRefreshRate(GetCurrentMonitor()));
  SetTraceLogLevel(LOG_WARNING);
  rlImGuiSetup(true);

  Demo demo;

  int screenWidth = GetScreenWidth();
  int screenHeight = GetScreenHeight();
  while (!WindowShouldClose())
  {
    demo.processKeyboardInput();
    demo.update();
    BeginDrawing();
      demo.processMouseInput();
      demo.render();
      rlImGuiBegin();
        demo.renderUI();
      rlImGuiEnd();
    EndDrawing();
    if (screenWidth != GetScreenWidth() || screenHeight != GetScreenHeight()) {
      screenWidth = GetScreenWidth();
      screenHeight = GetScreenHeight();
      demo.resize();
    }
  }

  rlImGuiShutdown();
  CloseWindow();
}
