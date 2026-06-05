export const CN_RELEASES_URL = 'https://github.com/402617833/Hermes-Desktop-CN/releases'

export function openCnReleases(): void {
  void window.hermesDesktop?.openExternal?.(CN_RELEASES_URL)
}
