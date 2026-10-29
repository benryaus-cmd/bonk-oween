import type { CharacterPose } from '@/art/CharacterPose';
import type { ArtPalette } from '@/art/palette';

/** Homemade Halloween costumes on the same small walking kid. All coordinates share the ghost's local space. */
export function drawCostume(ctx: CanvasRenderingContext2D, pose: CharacterPose, kind: 'frankenstein' | 'vampire', palette: ArtPalette, line: number): void {
  const vampire = kind === 'vampire';
  const trail = Math.sin(pose.walk - 0.8) * 10;
  const outline = palette.outline;
  ctx.save();
  ctx.translate(pose.lean * 1.4, pose.bobY - pose.hemBounce * 1.2);
  ctx.rotate(pose.rotation * Math.PI / 180);
  ctx.scale(pose.scaleX, pose.scaleY);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = line; ctx.strokeStyle = outline;
  // Loose outer cape moves behind a smaller, fitted jacket.
  ctx.fillStyle = vampire ? '#9B284D' : '#6A4A83';
  ctx.beginPath(); ctx.moveTo(-38, -54); ctx.quadraticCurveTo(-78, 5, -80 - trail, 78);
  ctx.quadraticCurveTo(-34, 102 + trail / 3, -1, 71);
  ctx.quadraticCurveTo(36, 103 - trail / 3, 80 + trail, 78);
  ctx.quadraticCurveTo(75, 3, 38, -54); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = vampire ? '#292439' : '#65636D';
  ctx.beginPath(); ctx.moveTo(-37, -58); ctx.quadraticCurveTo(0, -72, 38, -58);
  ctx.lineTo(53 + trail / 3, 73); ctx.quadraticCurveTo(0, 91, -53 - trail / 3, 73);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.23)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-24, -25); ctx.quadraticCurveTo(-21, 18, -27, 61); ctx.stroke();
  ctx.strokeStyle = outline; ctx.lineWidth = line;
  ctx.fillStyle = vampire ? '#F5C7AD' : '#9CD684';
  ctx.beginPath(); ctx.ellipse(0, -59, 46, 49, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (vampire) {
    ctx.fillStyle = '#25223A';
    ctx.beginPath(); ctx.moveTo(-47, -82); ctx.quadraticCurveTo(-48, -112, -21, -114);
    ctx.quadraticCurveTo(-8, -111, 0, -91); ctx.quadraticCurveTo(14, -113, 28, -113);
    ctx.quadraticCurveTo(49, -108, 48, -80); ctx.quadraticCurveTo(27, -96, 17, -86);
    ctx.lineTo(0, -74); ctx.lineTo(-17, -86); ctx.quadraticCurveTo(-34, -93, -47, -82);
    ctx.fill(); ctx.stroke();
    // Cheap white shirt, pointy collar, and tiny red ribbon.
    ctx.fillStyle = '#F8ECE5'; ctx.beginPath(); ctx.moveTo(-40, -39);
    ctx.lineTo(-53, -58); ctx.lineTo(-7, -21); ctx.lineTo(0, -40); ctx.lineTo(7, -21);
    ctx.lineTo(53, -58); ctx.lineTo(40, -39); ctx.lineTo(0, -10); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#D74462'; ctx.beginPath(); ctx.moveTo(-13, -22); ctx.lineTo(0, -17);
    ctx.lineTo(13, -22); ctx.lineTo(0, -27); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = '#282837'; ctx.beginPath(); ctx.moveTo(-46, -82); ctx.lineTo(-44, -109);
    ctx.lineTo(-24, -109); ctx.lineTo(-24, -117); ctx.lineTo(-5, -110);
    ctx.lineTo(17, -117); ctx.lineTo(19, -108); ctx.lineTo(44, -107);
    ctx.lineTo(47, -79); ctx.quadraticCurveTo(0, -88, -46, -82); ctx.closePath(); ctx.fill(); ctx.stroke();
    // Cardboard neck bolts and rough, hand stitched forehead.
    ctx.fillStyle = '#BEC6C7'; ctx.fillRect(-54, -55, 11, 11); ctx.strokeRect(-54, -55, 11, 11);
    ctx.fillRect(43, -55, 11, 11); ctx.strokeRect(43, -55, 11, 11);
    ctx.strokeStyle = '#4D806A'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-36, -68); ctx.lineTo(-30, -61); ctx.lineTo(-32, -53); ctx.stroke();
    ctx.fillStyle = '#B6BA83'; ctx.beginPath(); ctx.roundRect(-20, 5, 40, 17, 3); ctx.fill();
    ctx.fillStyle = '#33333B'; ctx.textAlign = 'center'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('FRANK', 0, 17);
  }
  ctx.fillStyle = '#29243A';
  const open = Math.max(0.14, 1 - pose.blink);
  for (const dir of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(dir * 17, -60, 7, 9 * open, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF'; ctx.beginPath();
    ctx.arc(dir * 17 - 2 + pose.pupilX, -63 + pose.pupilY, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#29243A';
  }
  ctx.strokeStyle = '#663F48'; ctx.lineWidth = 2.5; ctx.beginPath();
  ctx.arc(0, -40, 10, 0.15, Math.PI - 0.15); ctx.stroke();
  if (vampire) {
    ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.moveTo(-8, -39); ctx.lineTo(-4, -31);
    ctx.lineTo(-1, -39); ctx.moveTo(5, -39); ctx.lineTo(8, -31); ctx.lineTo(11, -39); ctx.fill();
  }
  ctx.restore();
}
