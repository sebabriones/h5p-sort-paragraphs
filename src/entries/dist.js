import '../styles/h5p-sort-paragraphs.scss';
import SortParagraphsCFRD from '../scripts/h5p-sort-paragraphs.js';

// Preserve PlayArea from play-area-scale.js (loaded before this bundle).
const playAreaApi = H5P.SortParagraphsCFRD && H5P.SortParagraphsCFRD.PlayArea;

H5P.SortParagraphsCFRD = SortParagraphsCFRD;

if (playAreaApi) {
  H5P.SortParagraphsCFRD.PlayArea = playAreaApi;
}
