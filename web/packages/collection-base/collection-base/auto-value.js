/* (auto)value modifiers */

AutoValue = {}

// make sure that urls start with http:// or https://
AutoValue.prefixUrlWithHTTP = function() {
  if (this.isSet) 
    return Url.externUrl(this.value)
}