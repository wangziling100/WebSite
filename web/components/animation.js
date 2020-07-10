import styled, { keyframes, css } from 'styled-components'

export const appear = keyframes `
  0% { opacity: 0; }
  80% { opacity: 0; }
  100% { opacity: 1; }
`;
export const linear_appear = keyframes `
  0% { opacity:0; }
  100% { opacity:1; }
`;
const hello_appear = keyframes `
  0% { opacity: 0; }
  50% { opacity: 0; }
  80% { opacity: 1; }
  100% { opacity: 0; }

`;
export const rotate_type1 = keyframes `
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`;

export const Appear = styled.div`
  animation: ${appear} ${props => props.duration || "5s"} ;
`;
export const LinearAppear = styled.div`
  animation: ${linear_appear} ${props => props.duration || "5s"};
`;
export const HelloAppear = styled.div`
  animation: ${hello_appear} ${props => props.duration || "5s"};
  opacity: 0
`;
export const RotateType1 = styled.div`
  animation: ${rotate_type1} 2s linear infinite;
`
