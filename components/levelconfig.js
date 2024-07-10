import images from '../components/images';

const levelConfig = [
  {
    range: [1, 1],
    image: images.hungrydog,
    label: 'Hungry Dog',
  },
  {
    range: [2, 5],
    image: images.shiba,
    label: 'Weak Doge',
  },
  {
    range: [6, 10],
    image: images.swoledoge,
    label: 'Swole Doge',
  },
  {
    range: [11, Infinity],
    image: images.sigmadoge,
    label: 'Sigma Doge',
  },
  // Add more ranges as needed
];

export default levelConfig;
