interface IntroLayoutInput {
  isMobile: boolean
  width: number
  height: number
}


function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function getIntroLayout({ isMobile, width, height }: IntroLayoutInput) {
  const vw = width / 100
  const vh = height / 100
  const nameLeft = isMobile ? 5 * vw : 8 * vw
  const nameTop = isMobile ? 12 * vh : 15 * vh
  const nameFontSize = isMobile ? 13 * vw : 8 * vw
  const nameLineHeight = 0.9
  const nameBlockHeight = nameFontSize * nameLineHeight * 2
  const experienceGap = clamp(
    nameFontSize * (isMobile ? 0.9 : 0.78),
    isMobile ? 38 : 56,
    isMobile ? 72 : 96
  )

  return {
    nameLeft,
    nameTop,
    nameFontSize,
    nameLineHeight,
    experienceLeft: nameLeft + (isMobile ? 4 : 7),
    experienceTop: nameTop + nameBlockHeight + experienceGap,
  }
}