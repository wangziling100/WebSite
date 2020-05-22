import styled, { keyframes, css } from 'styled-components'

export const appear = keyframes `
  0% { opacity: 0; }
  50% { opacity: 0; }
  100% { opacity: 1; }
`;
export const linear_appear = keyframes `
  0% { opacity:0; }
  100% { opacity:1; }
`;
export const Appear = styled.div`
  animation: ${appear} ${props => props.duration || "5s"} ;
`;
export const LinearAppear = styled.div`
  animation: ${linear_appear} ${props => props.duration || "5s"};
`;
