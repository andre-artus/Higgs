/* _________________________________________________________________________
 *
 *             Tachyon : A Self-Hosted JavaScript Virtual Machine
 *
 *
 *  This file is part of the Tachyon JavaScript project. Tachyon is
 *  distributed at:
 *  http://github.com/Tachyon-Team/Tachyon
 *
 *
 *  Copyright (c) 2011, Universite de Montreal
 *  All rights reserved.
 *
 *  This software is licensed under the following license (Modified BSD
 *  License):
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are
 *  met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the name of the Universite de Montreal nor the names of its
 *      contributors may be used to endorse or promote products derived
 *      from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 *  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 *  TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 *  PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL UNIVERSITE DE
 *  MONTREAL BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * _________________________________________________________________________
 */

/**
@fileOverview
Implementation of ECMAScript 5 string string routines.

@author
Bruno Dufour, Maxime Chevalier-Boisvert, Olivier Matz

@copyright
Copyright (c) 2010-2011 Tachyon Javascript Engine, All Rights Reserved
*/

/**
@class 15.5.2 String constructor
new String(value)
String(value)
*/
function String(value)
{
    // If this is a constructor call (new String)
    if ($rt_isGlobalObj(this) === false)
    {
        // Convert the value to a string
        var strVal = $rt_toString(value);

        // Store the value in the new object
        // TODO: this should be a hidden/internal property
        this.value = strVal;

        // Set length property.
        this.length = strVal.length;
    }
    else
    {
        // Convert the value to a string
        return $rt_toString(value);
    }
}

//-----------------------------------------------------------------------------

/**
Internal string functions
*/

function string_internal_toString(s)
{
    if (s instanceof String)
        return s.value;

    return s;
}

function string_internal_charCodeAt(s, pos)
{
    return $rt_str_get_data(s, pos);
}

function string_internal_getLength(s)
{
    return $rt_str_get_len(s)
}

function string_internal_toCharCodeArray(x)
{
    var s = x.toString();
    //var a = new Array(s.length);
    var a = [];
    a.length = s.length;

    for (var i = 0; i < s.length; i++)
        a[i] = $rt_str_get_data(s, i);

    return a;
}

function string_internal_fromCharCodeArray(a)
{
    // Get the array length
    var len = $rt_arr_get_len(a);

    // Allocate a string object
    var strObj = $rt_str_alloc(len);

    // Copy the data into the string
    for (var i = 0; i < len; ++i)
        $rt_str_set_data(strObj, i, a[i]);

    // Attempt to find the string in the string table
    return $ir_get_str(strObj);
}

function string_internal_isWhiteSpace(c)
{
    return (c >= 9 && c <= 13) || (c === 32) ||
           (c === 160) || (c >= 8192 && c <= 8202) || (c === 8232) ||
           (c === 8233) || (c === 8239) || (c === 8287) ||
           (c === 12288) || (c === 65279);
}

//-----------------------------------------------------------------------------

/**
15.5.3.2 String.fromCharCode([char0 [, char1 [, ... ]]])
*/
function string_fromCharCode()
{
    var args = Array.prototype.slice.call(arguments, 0);
    for(var i = 0; i < args.length; i++)
        args[i] = parseInt(args[i]);
    return string_internal_fromCharCodeArray(args);
}

/**
15.5.4.2 String.prototype.toString()
*/
function string_toString()
{
    return string_internal_toString(this);
}

/**
15.5.4.3 String.prototype.valueOf()
*/
function string_valueOf()
{
    return string_internal_toString(this);
}

/**
15.5.4.4 String.prototype.charAt(pos)
*/
function string_charAt(pos)
{
    if (pos < 0 || pos >= string_internal_getLength(this))
    {
        return '';
    }

    var ch = this.charCodeAt(pos);
    return string_internal_fromCharCodeArray([ch]);
}

/**
15.5.4.5 String.prototype.charCodeAt(pos)
*/
function string_charCodeAt(pos)
{
    var len = string_internal_getLength(this.toString());

    if (pos >= 0 && pos < len)
    {
        if ($ir_is_i32(pos) == false)
            pos = $rt_toUint32(pos);

        return string_internal_charCodeAt(this.toString(), pos);
    }

    return NaN;
}

/**
15.5.4.6 String.prototype.concat([string1 [, string2 [, ... ]]])
*/
function string_concat()
{
    var l = this.length;

    for (var i = 0; i < arguments.length; ++i)
        l += arguments[i].length;

    var s = $rt_str_alloc(l);
    var k = 0;

    for (var i = 0; i < this.length; ++i, ++k)
        $rt_str_set_data(s, k, this.charCodeAt(i));

    for (var i = 0; i < arguments.length; ++i)
        for (var j = 0; j < arguments[i].length; ++j, ++k)
            $rt_str_set_data(s, k, arguments[i].charCodeAt(j));

    // Attempt to find the string in the string table
    return $ir_get_str(s);
}

/**
15.5.4.7 String.prototype.indexOf(searchString, position)
*/
function string_indexOf(searchString, pos)
{
    var i;

    if (pos === undefined || pos < 0)
        i = 0;
    else
        i = pos;

    for (; i < this.length; ++i)
    {
        var j;

        for (j = 0; j < searchString.length; ++j)
            if (this.charCodeAt(i + j) !== searchString.charCodeAt(j))
                break;
        if (j === searchString.length)
            return i;
    }
    return -1;
}

/**
15.5.4.8 String.prototype.lastIndexOf(searchString, position)
*/
function string_lastIndexOf(searchString, pos)
{
    if (searchString.length > this.length)
        return -1;

    if (pos === undefined)
        pos = this.length;
    else if (pos >= this.length)
        pos = this.length;
    else if (pos < 0)
        pos = 0;

    if (searchString.length === 0)
        return pos;

    if (pos + searchString.length > this.length)
        pos = this.length - searchString.length;
    
    var firstChar = searchString.charCodeAt(0);
    for (var i = pos; i >= 0; i--)
    {
        if (this.charCodeAt(i) === firstChar)
        {
            var match = true;
            for (var j = 1; j < searchString.length; j++)
            {
                if (this.charCodeAt(i + j) !== searchString.charCodeAt(j))
                {
                    match = false;
                    break;
                }
            }
            if (match) return i;
        }
    }

    return -1;
}

/**
15.5.4.9 String.prototype.localeCompare(that)
*/
function string_localeCompare(that)
{
    var length = this.length;

    if (that.length < length)
        length = that.length;

    var i;

    for (i = 0; i < length; i++)
    {
        var a = this.charCodeAt(i);
        var b = this.charCodeAt(i);

        if (a !== b)
        {
            return a - b;
        }
    }

    if (this.length > length)
    {
        return 1;
    }
    else if (that.length > length)
    {
        return -1;
    }
    else
    {
        return 0;
    }
}

/**
15.5.4.10 String.prototype.match(regexp)
*/
function string_match(regexp)
{
    var re;

    if (regexp instanceof RegExp)
        re = regexp;
    else
        re = new RegExp(regexp);

    if (re.global)
    {
        var result = [];
        var match;

        while ((match = re.exec(this)) !== null)
            result.push(match[0]);

        if (result.length === 0)
            return null;

        return result;
    }
    else
    {
        return re.exec(this);
    }
}

/**
15.5.4.11 String.prototype.replace(searchValue, replaceValue)
*/
function string_replace(searchValue, replaceValue)
{
    if (typeof searchValue === "string")
    {
        var pos = this.indexOf(searchValue);

        if (typeof replaceValue === "function")
        {
            var ret = replaceValue(searchValue, pos, this.toString());

            return this.substring(0, pos).concat(
                new String(ret).toString(),
                this.substring(pos + string_internal_getLength(searchValue)));
        }
        else
        {
            return this.substring(0, pos).concat(
                replaceValue.toString(),
                this.substring(pos + string_internal_getLength(searchValue)));
        }
    }
    else if (searchValue instanceof RegExp)
    {
        // Save regexp state
        var globalFlagSave = searchValue.global;
        var lastIndexSave = searchValue.lastIndex;
        var match;

        // Set the regexp global to get matches' index
        searchValue.global = true;
        searchValue.lastIndex = 0;

        // Will hold new string parts.
        var nsparts = [];
        var nslen = 0;
        var i = 0;

        do {
            // Execute regexp
            match = searchValue.exec(this);

            // Stop if no match left
            if (match === null)
                break;

            // Get the last match index
            var matchIndex = searchValue.lastIndex - match[0].length;

            if (typeof replaceValue === "function")
            {
                if (i < matchIndex)
                    nsparts.push(this.substring(i, matchIndex));

                // Compose the arguments array with the match array.
                match.push(matchIndex);
                match.push(this.toString());

                var ret = replaceValue.apply(null, match);
                nsparts.push(new String(ret).toString());
            }
            else
            {
                // Expand replaceValue
                var rvparts = [];
                var j = 0, k = 0;

                // Get the string representation of the object.
                replaceValue = replaceValue.toString();

                for (; j < replaceValue.length; ++j)
                {
                    // Expand special $ form
                    if (replaceValue.charCodeAt(j) === 36) // '$'
                    {
                        if (k < j)
                            rvparts.push(replaceValue.substring(k, j));

                        var c = replaceValue.charCodeAt(j + 1);

                        if (c === 36) // '$'
                        {
                            ++j;
                            rvparts.push("$");
                        }
                        else if (c === 38) // '&'
                        {
                            ++j;
                            rvparts.push(match[0]);
                        }
                        else if (c === 96) // '`'
                        {
                            ++j;
                            rvparts.push(this.substring(0, matchIndex));
                        }
                        else if (c === 39) // '''
                        {
                            ++j;
                            rvparts.push(this.substring(searchValue.lastIndex));
                        }
                        else if (c >= 48 && c <= 57)
                        {
                            ++j;

                            var n = 0;
                            var cn = replaceValue.charCodeAt(j + 1);
                            if (cn >= 48 && cn <= 57)
                            {
                                n = (cn - 48) * 10;
                                ++j;
                            }
                            n += c - 48;

                            // Push submatch if index is valid, or the raw string if not.
                            if (n < match.length)
                                rvparts.push(match[n]);
                            else
                                rvparts.push("$" + n);
                        }
                        else
                        {
                            rvparts.push("$");
                        }
                        k = j + 1;
                    }
                }

                if (k === 0)
                {
                    if (i < matchIndex)
                        nsparts.push(this.substring(i, matchIndex));

                    // Not expansion occured : push raw replaceValue.
                    if (replaceValue.length > 0)
                        nsparts.push(replaceValue);
                }
                else
                {
                    // Get the last not expanded part of replaceValue.
                    if (k < replaceValue.length - 1)
                        rvparts.push(replaceValue.substring(k, replaceValue.length));

                    if (i < matchIndex)
                        nsparts.push(this.substring(i, matchIndex));

                    var expandedrv = rvparts.join("");

                    if (expandedrv.length > 0)
                        nsparts.push(expandedrv);
                }
            }

            i = searchValue.lastIndex;
        } while (globalFlagSave);

        if (i < this.length)
            nsparts.push(this.substring(i, this.length));

        searchValue.global = globalFlagSave;
        searchValue.lastIndex = lastIndexSave;

        return nsparts.join("");
    }
    return this.toString();
}

/**
15.5.4.12 String.prototype.search(regexp)
*/
function string_search(regexp)
{
    var re;
    var globalSave;
    var lastIndexSave;

    if (regexp instanceof RegExp)
        re = regexp;
    else
        re = new RegExp(regexp);

    globalSave = re.global;
    lastIndexSave = re.lastIndex;
    re.global = true;
    re.lastIndex = 0;

    var matchIndex = -1;
    var match = re.exec(this);
    if (match !== null)
    {
        matchIndex = re.lastIndex - match[0].length;
    }

    re.global = globalSave;
    re.lastIndex = lastIndexSave;
    return matchIndex;
}

/**
15.5.4.14 String.prototype.split(separator, limit)
*/
function string_split(separator, limit)
{
    var res = new Array();
    if (limit === 0) return res;

    var len = this.length;
    if (len === 0) return res;

    if (separator === undefined)
        return [this];

    var pos = this.indexOf(separator);
    var start = 0;
    var sepLen = separator.length;

    while (pos >= 0)
    {
        res.push(this.substring(start, pos));
        if (res.length === limit) return res;
        start = pos + sepLen;
        pos = this.indexOf(separator, pos + sepLen);
    }

    if (start <= len)
    {
        res.push(this.substring(start));
    }

    return res;
}

/**
15.5.4.15 String.prototype.substring(start, end)
*/
function string_substring(start, end)
{
    var source = this.toString();
    var length = string_internal_getLength(source.toString());

    if (start < 0)
        start = 0;
    else if (start > length)
        start = length;

    if (end === undefined)
        end = length;
    else if (end > length)
        end = length;
    else if (end < 0)
        end = 0;

    if (start > end)
    {
        var tmp = start;
        start = end;
        end = tmp;
    }
    
    // Allocate new string.
    var s = $rt_str_alloc(end - start);

    // Copy substring characters in the new allocated string.
    for (var i = start, j = 0; i < end; ++i, ++j)
        $rt_str_set_data(s, j, source.charCodeAt(i));

    return $ir_get_str(s);
}

/**
15.5.4.12 String.prototype.slice(start, end)
*/
function string_slice(start, end)
{
    var source = this.toString();
    var length = string_internal_getLength(source.toString());
    if (typeof start === 'undefined')
        start = 0;
    if (typeof end === 'undefined')
        end = length;

    if (start < 0)
        start += length;

    if (end < 0)
        end += length;

    return string_substring.call(this, start, end);
}

/**
String.prototype.substr(start, length)
*/
function string_substr(start, length)
{
    var end = (length === undefined) ? undefined : (start + length);

    return string_substring.apply(this, [start, end]);
}

/**
15.5.4.16 String.prototype.toLowerCase()
*/
function string_toLowerCase()
{
    var a = string_internal_toCharCodeArray(this);

    // This code assumes the array is a copy of the internal char array.
    // It may be more efficient to expose the internal data directly and
    // make a copy only when necessary.
    
    for (var i = 0; i < a.length; i++)
    {
        var c = a[i];
        // FIXME: support full Unicode
        if (c > 255) error("Only ASCII characters are currently supported");

        if ((c >= 65 && c <= 90)
                || (c >= 192 && c <= 214)
                || (c >= 216 && c <= 222))
        {
            a[i] = c + 32;
        }
    }

    return string_internal_fromCharCodeArray(a);
}

/**
15.5.4.17 String.prototype.toLocaleLowerCase()
*/
function string_toLocaleLowerCase()
{
    // FIXME: not quire correct for the full Unicode
    return this.toLowerCase();
}

/**
15.5.4.18 String.prototype.toUpperCase()
*/
function string_toUpperCase()
{
    var a = string_internal_toCharCodeArray(this);

    for (var i = 0; i < a.length; i++)
    {
        var c = a[i];
        // FIXME: support full Unicode
        if (c > 255)
            error("Only ASCII characters are currently supported");

        if ((c >= 97 && c <= 122)  || 
            (c >= 224 && c <= 246) || 
            (c >= 248 && c <= 254))
            a[i] = c - 32;
    }

    return string_internal_fromCharCodeArray(a);
}

/**
15.5.4.19 String.prototype.toLocaleUpperCase()
*/
function string_toLocaleUpperCase()
{
    // FIXME: not quire correct for the full Unicode
    return this.toUpperCase();
}

/**
15.5.4.20 String.prototype.trim()
*/
function string_trim()
{
    var from = 0, to = this.length - 1;

    while (string_internal_isWhiteSpace(this.charCodeAt(from)))
        ++from;

    while (string_internal_isWhiteSpace(this.charCodeAt(to)))
        --to;

    return this.substring(from, to + 1);
}

/**
Setup String method.
*/

String.fromCharCode = string_fromCharCode;

/**
Setup String prototype.
*/

String.prototype.toString = string_toString;
String.prototype.charCodeAt = string_charCodeAt;
String.prototype.valueOf = string_valueOf;
String.prototype.charAt = string_charAt;
String.prototype.concat = string_concat;
String.prototype.indexOf = string_indexOf;
String.prototype.lastIndexOf = string_lastIndexOf;
String.prototype.localeCompare = string_localeCompare;
String.prototype.slice = string_slice;
String.prototype.match = string_match;
String.prototype.replace = string_replace;
String.prototype.search = string_search;
String.prototype.split = string_split;
String.prototype.substring = string_substring;
String.prototype.substr = string_substr;
String.prototype.toLowerCase = string_toLowerCase;
String.prototype.toLocaleLowerCase = string_toLocaleLowerCase;
String.prototype.toUpperCase = string_toUpperCase;
String.prototype.toLocaleUpperCase = string_toLocaleUpperCase;
String.prototype.trim = string_trim;

String.prototype.concat.length = 1;
String.prototype.indexOf.length = 1;
String.prototype.lastIndexOf.length = 1;
String.prototype.slice.length = 2;
String.prototype.split.length = 2;
String.prototype.substring.length = 2;

//-----------------------------------------------------------------------------

