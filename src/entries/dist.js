import '../styles/h5p-sort-paragraphs.scss';
import SortParagraphsCFRD from '../scripts/h5p-sort-paragraphs.js';

// Preserve APIs from standalone scripts loaded before this bundle.
const playAreaApi = H5P.SortParagraphsCFRD && H5P.SortParagraphsCFRD.PlayArea;
const appearanceApi = H5P.SortParagraphsCFRD && H5P.SortParagraphsCFRD.Appearance;

H5P.SortParagraphsCFRD = SortParagraphsCFRD;

if (playAreaApi) {
  H5P.SortParagraphsCFRD.PlayArea = playAreaApi;
}

if (appearanceApi) {
  H5P.SortParagraphsCFRD.Appearance = appearanceApi;
}
